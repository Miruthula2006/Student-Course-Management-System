const lessonTemplates = [
    {
        type: "Video",
        icon: "fa-solid fa-circle-play",
        titleSuffix: "Concept Video",
        duration: "12 min",
        content: (course) => `Watch the introductory lesson for ${course.title}. Review the main concepts, terminology, and learning goals before moving to the next resource.`
    },
    {
        type: "PDF",
        icon: "fa-solid fa-file-pdf",
        titleSuffix: "Study Notes",
        duration: "8 pages",
        content: (course) => `Study the guided notes for ${course.title}. The notes cover the key concepts introduced in the course and provide a quick revision reference.`
    },
    {
        type: "Practice",
        icon: "fa-solid fa-list-check",
        titleSuffix: "Practice & Checkpoint",
        duration: "10 questions",
        content: (course) => `Complete the practice checkpoint for ${course.title}. Use it to confirm that you understand the concepts before marking the course as complete.`
    }
];

export function buildDefaultMaterials(course) {
    return lessonTemplates.map((template, index) => ({
        id: `${course.id}-L${index + 1}`,
        type: template.type,
        icon: template.icon,
        title: `${course.title} — ${template.titleSuffix}`,
        duration: template.duration,
        content: template.content(course),
        url: index === 0 ? (course.videoUrl || "") : index === 1 ? (course.pdfUrl || "") : (course.practiceUrl || "")
    }));
}

export function normalizeCourse(course) {
    return {
        ...course,
        instructor: course.instructor || "Not Assigned",
        materials: Array.isArray(course.materials) && course.materials.length
            ? course.materials
            : buildDefaultMaterials(course)
    };
}

export function normalizeCourses(courses) {
    return (Array.isArray(courses) ? courses : []).map(normalizeCourse);
}

export function saveCourses(courses) {
    const normalized = normalizeCourses(courses);
    localStorage.setItem("courses", JSON.stringify(normalized));
    window.dispatchEvent(new Event("coursesChanged"));
    return normalized;
}

export function getStudentByEmail(email) {
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    return students.find((student) => student.email === email) || null;
}

export function saveStudent(student) {
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const index = students.findIndex((item) => String(item.id) === String(student.id));
    if (index >= 0) students[index] = student;
    else students.push(student);
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("loggedInUser", JSON.stringify(student));
    window.dispatchEvent(new Event("studentDataChanged"));
    return student;
}

export function getCourseProgress(student, course) {
    const progress = student?.courseProgress?.[course.id];
    const completed = Array.isArray(progress) ? progress : [];
    const materials = Array.isArray(course.materials) ? course.materials : [];
    const completedCount = materials.filter((item) => completed.includes(item.id)).length;
    return {
        completedIds: completed,
        completedCount,
        total: materials.length,
        percent: materials.length ? Math.round((completedCount / materials.length) * 100) : 0,
        complete: materials.length > 0 && completedCount === materials.length
    };
}

export function issueCertificate(student, course) {
    const certificates = Array.isArray(student.certificates) ? [...student.certificates] : [];
    const existing = certificates.find((item) => item.courseId === course.id);
    if (existing) return { student, certificate: existing };

    const certificate = {
        id: `CERT-${Date.now()}`,
        courseId: course.id,
        courseTitle: course.title,
        studentId: student.id,
        studentName: student.name || student.fullName || "Student",
        instructor: course.instructor || "Not Assigned",
        issueDate: new Date().toLocaleDateString(),
        issuedAt: new Date().toISOString()
    };

    certificates.push(certificate);
    student.certificates = certificates;
    return { student, certificate };
}
