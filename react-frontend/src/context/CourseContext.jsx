
import {
  useCallback,
  useEffect,
  useState
} from "react";

import api from "../services/api";
import { CourseContext } from "./courseContextData.js";

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/v1/courses");

      setCourses(response.data.data || []);
      setError(null);
    } catch (fetchError) {
      console.error("Failed to fetch courses", { status: fetchError.response?.status });
      setError("Unable to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  async function addCourse(course) {
    const response = await api.post(
      "/api/v1/courses",
      course
    );

    setCourses((previousCourses) => [
      ...previousCourses,
      response.data.data
    ]);
  }

  async function updateCourse(id, updatedCourse) {
    const response = await api.put(
      `/api/v1/courses/${id}`,
      updatedCourse
    );

    setCourses((previousCourses) =>
      previousCourses.map((course) =>
        String(course.id ?? course._id) === String(id)
          ? response.data.data
          : course
      )
    );
  }

  async function deleteCourse(id) {
    await api.delete(`/api/v1/courses/${id}`);

    setCourses((previousCourses) =>
      previousCourses.filter(
        (course) => String(course.id ?? course._id) !== String(id)
      )
    );
  }

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        fetchCourses,
        addCourse,
        updateCourse,
        deleteCourse
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}
