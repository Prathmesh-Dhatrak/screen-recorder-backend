import { FastifyPluginAsync } from "fastify";
const admin = require("firebase-admin");
const json = {
  type: "service_account",
  project_id: "iv-screen-recorder-server",
  private_key_id: "d583d0272ee5c47da6d2697d319c90fe892e1d3d",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC8kDlLBDbSD+kM\nEf05SYvEPJi8wVn+iU5tCVjeEPhHAKswtbLUYIv+LrQVzWh1TwBA9e2EeO3odWyw\nn54gQQgmSGnoVp3HUtQMOGC/fFd52bvuVSDspaM/1RmAxwkU7TnqVuosA87ydkwm\nyo8lnVFt+iTCi7KoQs9G2BMDiyml37pdEpve/5tOMy+vmyQijfnxq+y9fykXFjn5\nM7jtxa5ZwwbfXlhyPjHOsh0ItojkjLOdWJWaI6eE5f7Wc+2vJlc4JBOs85r5cwEQ\nE+T2IcbRXM0HjfR5G5V9uSBD7oYyDc+4uNnf8wC0iCC04iA2mC5MjwjnnQTOaUbC\nwtY8JJwhAgMBAAECggEAGwMNFgw7PzHUyGweSpHY0gp9NdL77ZzlTXTglGU5b9Bu\ndZqdzNMs0sOFfDcR7vYbevLP7OF28U06/f1LpWKzhGpss4IO9aINqtd7soqhLF0u\n0QhEYGok/eysy9gXWrZWDNYZEyeTgoPESm1Lfs+vvdGu6OiitfxmHYewB5qso2xu\n8nS7JWfqAQUJgPD3uEEaEqb0sH+fsiTRByqw2nCGDRX25JOqrrMtr1jLC0MRljQy\n6YIzWaGW7pP4u8cG/+6pvUtSjVVqgpoxmfDnwfjxXLTLOAwtHZXh+xUs/AuiN7QC\nAdbsvCgmx+Ustn/bjPFAMPY16bWtu9undXttYox3rQKBgQD+TkQ04zt8DtSjBhtf\n8o1nqEev9I1Dxxt34IlsUPa+yPDSIjoJXrYb9qreCpY9JWdaWPTRAppPefmoXCvb\nMuok0HZRfhIEaLAN54H4s6dA5couIcBaSDYYqhhru8rbAYgpQHLpuJrFtr75iWJo\npxBemvt8n6GVe/KH3Bo0AxLQ7QKBgQC90dRyOlMJahVvp/5JPH00gvCt726g5W3R\ndKC6RIt2CRY2mwccfaD7+PgDUlq1VcYoyRuBIpsISt6dCnDmD07kLkOWYuHkcVfU\nCPkPJVESwYqemh+Q27C+D059bjX/1ZHlDeit15ojoop+peyOcGASONsxC1Cdfi1+\nsAs0a/E1hQKBgDjqs4FSymF9wEGsgDv9QYDNvR24klV1HsS50IgZpuAUgTHGz06B\nkCi6EIwZun58/KDQABs3hen71tDDsF0jDBypO5IJsWajN6QlCIXtT6XKyHGCxFZw\niwsCJu0V3tUdhqgU8KM22g0eVafsA8aAfb1u2pKN99BJKYMW1BaICZIRAoGAPh5X\n3tXVbMRJpZOddMwV0UR0jQdI9eB/EseO/cYGuab5nP8Y0asPLsZoK3Yc9zDNu3Us\nyhLQF2Og/FV5YuBpmeTF+4X6lK6+5kXVc65rnK63tXWMlPRAH8KUlhmmFEYJC6OE\nnLds2vKLTizwgCCoX+45VRB13kR3kPj9gbc9ZZ0CgYBXRzyeYGajTluL+Cl7r/0Y\nIneDA4xDIYXekaN4glMTsKiHOdxYN81U6Rozh+2QV7XYFdBe6J8YQHPtKTzFQz/g\nZkzs5UgOjdeKn1CoEOF3s/D3gOB93qf5GU5Kddvs+QEUnBOCpqch2rNmhokNg7iN\nr7Y3SHolqZmJkUSLiWLRgg==\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-cf5m9@iv-screen-recorder-server.iam.gserviceaccount.com",
  client_id: "111630268120970677343",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-cf5m9%40iv-screen-recorder-server.iam.gserviceaccount.com",
};

admin.initializeApp({
  credential: admin.credential.cert(json),
});

interface VideoRequestBody {
  blob: string;
  name: string;
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
      const { blob, name } = req.body;
      const { id } = await admin
        .firestore()
        .collection("videos")
        .add({ blob, name });
      res.send({ id });
    } catch (error) {
      console.error(error);
      res.code(500).send({ error: "Internal server error" });
    }
  });

  fastify.get<{ Params: VideoParams }>("/videos/:id", async (req, res) => {
    try {
      const { name } = req.params;
      const snapshot = await admin
        .firestore()
        .collection("videos")
        .doc(name)
        .get();
      if (!snapshot.exists) {
        return res.code(404).send({ error: "Video not found" });
      }
      const { blob, _name } = snapshot.data();
      const videoBlob = Buffer.from(blob, "base64");

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

