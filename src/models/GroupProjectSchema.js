import mongoose, { Schema } from "mongoose";

const GroupProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    progress: {
      type: String,
      enum: ["0", "25", "50", "75", "100"],
      default: "0",
    },
    attachments: [ // attachments as a whole
      {
        filename: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    teammates: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assigntask: [
          {
            task: String,
            status: {
              type: String,
              enum: ["pending", "in-progress", "completed"],
              default: "pending",
            },
            dueDate: Date,
            attachments: [ 
              {
                filename: String,
                fileUrl: String,
                uploadedAt: {
                  type: Date,
                  default: Date.now,
                },
              },
            ],
          },
        ],
        comments: [
          {
            content: String,
            timestamp: {
              type: Date,
              default: Date.now,
            },
            attachments: [ 
              {
                filename: String,
                fileUrl: String,
                uploadedAt: {
                  type: Date,
                  default: Date.now,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Project =
  mongoose.models.Project || mongoose.model("Project", GroupProjectSchema);

export default Project;
