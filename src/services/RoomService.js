import { httpClient } from "../config/AxiosHelper";

// ✅ Create room
export const createRoomApi = async (roomId) => {
  const response = await httpClient.post(
    `/api/v1/rooms/create/${roomId}`
  );
  return response.data;
};

// ✅ Join room
export const joinChatApi = async (roomId) => {
  const response = await httpClient.get(
    `/api/v1/rooms/join/${roomId}`
  );
  return response.data;
};

// ✅ Get messages
export const getMessages = async (roomId, size = 20, page = 0) => {
  const response = await httpClient.get(
    `/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`
  );
  return response.data;
};