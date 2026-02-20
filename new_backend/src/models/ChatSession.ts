export interface ChatMessage {
  userId: string;
  sender: "user" | "ai";
  message: string;
  timestamp: Date;
}
