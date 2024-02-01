import mongoose, { Schema, Document } from "mongoose";

export interface ChatModel extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  type: string;
  isRead:Boolean;
  timestamp: Date;
}

const chatSchema = new Schema<ChatModel>({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean,  },
  type: { type: String, default:"text"},
  timestamp: {
    type: Date,
    default: Date.now()
  }
});

const Message = mongoose.model<ChatModel>("Chat", chatSchema);

export default Message;
