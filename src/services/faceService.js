// src/api/face.js
import api from "@/api/api";

/**
 * Register a new face using multiple captured frames
 * @param {string} name
 * @param {string} employeeNumber
 * @param {string[]} images - array of base64 data-URLs (5-10 frames)
 */
export const registerFace = async (name, employeeNumber, images) => {
  const { data } = await api.post("/register-face", {
    name,
    employee_number: employeeNumber,
    images, // ← plural, matches Laravel's validation rule
  });
  return data;
};

/**
 * Recognize a face using multiple captured frames
 * @param {string[]} images - array of base64 data-URLs (3-5 frames)
 */
export const recognizeFace = async (images) => {
  const { data } = await api.post("/recognize-face", { images });
  return data;
};
