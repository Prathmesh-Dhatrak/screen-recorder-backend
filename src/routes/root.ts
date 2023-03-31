import { FastifyPluginAsync } from "fastify";
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(
    "../../iv-screen-recorder-server-firebase-adminsdk-cf5m9-d583d0272e.json"
  ),
});

interface VideoRequestBody {
  blob: string;
  data: string;
}

interface VideoParams {
  id: string;
}
const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    return { root: true };
  });
  fastify.post<{ Body: VideoRequestBody }>("/videos", async (req, res) => {
    try {
      const { blob, data } = req.body;
      const { id } = await admin
        .firestore()
        .collection("videos")
        .add({ blob, data });
      res.send({ id });
    } catch (error) {
      console.error(error);
      res.code(500).send({ error: "Internal server error" });
    }
  });

  fastify.get<{ Params: VideoParams }>("/videos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const snapshot = await admin
        .firestore()
        .collection("videos")
        .doc(id)
        .get();
      if (!snapshot.exists) {
        return res.code(404).send({ error: "Video not found" });
      }
      const { data } = snapshot.data();
      const videoBlob = Buffer.from(data, "base64");

      res.headers({
        "Content-Type": "video/mp4",
        "Content-Length": videoBlob.length,
      });

      res.send(videoBlob);
    } catch (error) {
      console.error(error);
      res.code(500).send({ error: "Internal server error" });
    }
  });

  fastify.get("/videos", async function (request, reply) {
    return { video: true };
  });
};

export default root;

