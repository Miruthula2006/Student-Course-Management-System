import { useContext } from "react";
import { CourseContext } from "./courseContextData.js";

export function useCourses() {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }

  return context;
}
