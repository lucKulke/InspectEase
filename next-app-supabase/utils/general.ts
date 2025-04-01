import { UUID } from "crypto";

export const scrollToSection = (id: UUID) => {
  const section = document.getElementById(id);
  if (section) {
    const rect = section.getBoundingClientRect(); // Get section position
    const scrollOffset = window.scrollY + rect.top - window.innerHeight * 0.2; // 3/4 of viewport
    window.scrollTo({ top: scrollOffset, behavior: "smooth" });
  }
};
