import api from "@/api/api";

export const recognizeFace = async (images) => {
  const { data } = await api.post("/recognize-face", { images });
  return data;
};
