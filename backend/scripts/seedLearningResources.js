require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const LearningResource = require("../models/LearningResource");
const Course = require("../models/Course");

const sampleResources = {
  CS101: [
    { title: "Python values, variables, and expressions", description: "Read the course notes on Python values, variable assignment, numeric and string types, and expression evaluation. Try each example in a Python interpreter before marking this resource complete.", type: "Reading" },
    { title: "Branching and iteration practice", description: "Write small programs using if/elif/else, for loops, and while loops. Include boundary cases and explain how each loop terminates.", type: "Practice" },
    { title: "Functions and reusable modules", description: "Review function parameters, return values, scope, and importing modules. Create a small utility module and call its functions from a separate script.", type: "Reading" }
  ],
  CS201: [
    { title: "Arrays, linked lists, and complexity", description: "Compare array-based and linked-list storage. For each operation, describe its time complexity and identify when one structure is a better fit.", type: "Reading" },
    { title: "Stacks and queues checkpoint", description: "Trace push/pop and enqueue/dequeue operations for a sequence of values. Implement one stack and one queue, then test empty and full boundary cases.", type: "Practice" },
    { title: "Trees and traversal strategies", description: "Study binary tree terminology and trace preorder, inorder, and postorder traversals on a sample tree. Compare the output sequences.", type: "Reading" }
  ],
  AI101: [
    { title: "Problem formulation and state-space search", description: "Identify states, actions, transition rules, and goal tests for a small search problem. Compare breadth-first and depth-first search in terms of completeness and memory use.", type: "Reading" },
    { title: "Supervised learning workflow", description: "Outline a supervised learning workflow from labeled data through train/test splitting, model fitting, and evaluation. Explain why test data must remain unseen during training.", type: "Reading" },
    { title: "Classification metrics practice", description: "Construct a confusion matrix for a binary classifier and calculate accuracy, precision, recall, and F1 score. Explain which metric is most useful for an imbalanced dataset.", type: "Practice" }
  ]
};

async function seedLearningResources() {
  let added = 0;
  let skipped = 0;
  try {
    await connectDB();
    for (const [courseCode, samples] of Object.entries(sampleResources)) {
      const course = await Course.findOne({ courseCode });
      if (!course) {
        console.log(`${courseCode}: course not found; skipped.`);
        skipped += 1;
        continue;
      }

      const existingCount = await LearningResource.countDocuments({ course: course._id });
      if (existingCount > 0) {
        console.log(`${courseCode}: resources already exist; left unchanged.`);
        skipped += 1;
        continue;
      }

      const legacyMaterials = Array.isArray(course.materials) ? course.materials : [];
      const resources = legacyMaterials.length
        ? legacyMaterials.map((material, index) => ({
          title: material.title || `Learning resource ${index + 1}`,
          description: material.description || material.content || "Existing course material migrated from the course record.",
          type: ["PDF", "Video", "Document", "Link", "Practice", "Reading"].includes(material.type) ? material.type : "Reading",
          url: material.url || "",
          order: index
        }))
        : samples.map((resource, index) => ({ ...resource, order: index }));

      await LearningResource.insertMany(resources.map((resource) => ({ ...resource, course: course._id })));
      console.log(`${courseCode}: added ${resources.length} learning resources${legacyMaterials.length ? " from existing embedded materials" : ""}.`);
      added += resources.length;
    }
    console.log(`Resource seed complete: ${added} added, ${skipped} skipped. Existing progress was not modified.`);
  } finally {
    await mongoose.disconnect();
  }
}

seedLearningResources().catch((error) => {
  console.error("Learning resource seed failed:", error.message);
  process.exitCode = 1;
});
