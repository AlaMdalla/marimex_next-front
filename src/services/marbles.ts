// Marble service for Next.js/React
import axios from "axios";
import type { Comment, NewComment } from "@/types/comment";

const BASE_URL = "https://marimexbackend.vercel.app";
export const MARBEL_URL = `${BASE_URL}/api/marble`;
export const COMMENTS_URL = `${BASE_URL}/api/comments`;
export const UPLOAD_IMAGE = `${BASE_URL}/api/marble/upload`;
export const COMMANDE = `${BASE_URL}/api/commande`;
export const MARBEL_TAGS_URL = `${MARBEL_URL}/tags`;
export const MARBEL_BY_SEARCH_URL = `${MARBEL_URL}/search/`;
export const MARBEL_BY_TAG_URL = `${MARBEL_URL}/tags/`;
export const MARBEL_BY_ID_URL = `${MARBEL_URL}/`;
export const USER_LOGIN_URL = `${BASE_URL}/api/users/login`;
export const USER_REGISTER_URL = `${BASE_URL}/api/users/register`;
export const MARBEL_AddMARBEL_URL = `${MARBEL_URL}/create`;
export const GOOGLE_AUTH_URL = `${BASE_URL}/api/users/google`;

export async function getMarbleById(marbleId: string) {
  const res = await axios.get(`${MARBEL_BY_ID_URL}${marbleId}`);
  return res.data;
}

export async function getAllMarbles() {
  const res = await axios.get(MARBEL_URL);
  return res.data;
}

export async function getAllTags() {
  const res = await axios.get(MARBEL_TAGS_URL);
  return res.data;
}

export async function getMarblesByTag(tag: string) {
  if (tag === "All") return getAllMarbles();
  const res = await axios.get(`${MARBEL_BY_TAG_URL}${tag}`);
  return res.data;
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await axios.post(UPLOAD_IMAGE, formData);
  return res.data;
}

export async function addMarble(marble: any) {
  const res = await axios.post(MARBEL_AddMARBEL_URL, marble);
  return res.data;
}

export async function deleteMarble(marbleId: string) {
  const res = await axios.delete(`${MARBEL_BY_ID_URL}${marbleId}`);
  return res.data;
}

export async function updateMarble(marbleId: string, marble: any) {
  const res = await axios.put(`${MARBEL_URL}/${marbleId}`, marble);
  return res.data;
}

// Submit an order (commande)
export async function submitOrder(payload: any) {
  const res = await axios.post(COMMANDE, payload);
  return res.data;
}

// Comments API (mirrors Angular service)
export async function getCommentsByMarbleId(marbleId: string): Promise<Comment[]> {
  const { data } = await axios.get<Comment[]>(`${COMMENTS_URL}/marble/${marbleId}`)
  return data
}

export async function addComment(comment: Partial<NewComment>): Promise<Comment> {
  const { data } = await axios.post<Comment>(`${COMMENTS_URL}/add`, comment)
  return data
}

export async function deleteComment(commentId: string): Promise<void> {
  await axios.delete(`${COMMENTS_URL}/${commentId}`)
}

export async function updateComment(commentId: string, text: string): Promise<Comment> {
  const { data } = await axios.patch<Comment>(`${COMMENTS_URL}/${commentId}`, { text })
  return data
}
