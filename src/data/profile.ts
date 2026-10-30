export interface ProfileLink {
  label: string;
  href: string;
}

export interface Identity {
  name: string;
  title: string;
  location: string;
  stackLine: string;
  email: string;
  resumePath: string;
  links: {
    resume: ProfileLink;
    github: ProfileLink;
    linkedin: ProfileLink;
    email: ProfileLink;
  };
}

const email = "gonzalezchristianlopez@gmail.com";

// Stable public path: replace the file in /public, never rename it.
const resumePath = "/Christian-Gonzalez-Resume.pdf";

export const identity: Identity = {
  name: "Christian Gonzalez Lopez",
  title: "Full-Stack Software Engineer",
  location: "Miami, FL",
  stackLine:
    "React and TypeScript on the front end, Node.js and Java REST APIs behind them. Most recently building payments experiences at American Express.",
  email,
  resumePath,
  links: {
    resume: { label: "Resume", href: resumePath },
    github: { label: "GitHub", href: "https://github.com/cnovelles" },
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/christian-g-5509a013a",
    },
    email: { label: "Email", href: `mailto:${email}` },
  },
};
