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
      type: Number,
      default: 0,
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
        feedback:String,
        assigntask: [
          {
            task: String,
            status: {
              type: String,
              enum: ["pending", "in-progress", "completed"],
              default: "pending",
            },
            dueDate: Date,
            completedAt:Date,
            createdAt:Date,
            
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
            qualityScore:{
              rating:{type: Number,min:1,max:5},
                reviewNotes:String,
           
            },
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
        taskCompletionStats: {
          totalAssigned: { type: Number, default: 0 },
          completed: { type: Number, default: 0 },
          pending: { type: Number, default: 0 },
          inProgress: { type: Number, default: 0 },
          averageCompletionTime: { type: Number, default: 0 }, 
          deadlinesMet: { type: Number, default: 0 },
          totalCompletionTime:{type :Number,default:0}
        },
       
      },
    ],
  },
  { timestamps: true }
);

GroupProjectSchema.pre("save", function (next) {
  this.teammates.forEach(teammate => {
    teammate.assigntask.forEach(task => {
      if (task.status === "completed" && !task.completedAt) {
        task.completedAt = new Date();
       
      }
    });
  });
  next();
});

const Project =
  mongoose.models.Project || mongoose.model("Project", GroupProjectSchema);

export default Project;
