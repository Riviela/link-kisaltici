export const copy = {
  metadata: {
    title: "Canvas Links",
    description: "A focused home for the links that matter.",
  },
  navigation: {
    login: "Log in",
    register: "Create account",
    dashboard: "Dashboard",
  },
  home: {
    eyebrow: "Your online presence, in one place",
    title: "Make every link feel intentional.",
    description:
      "Create a simple home for your work, ideas, and the places people can find you online.",
  },
  auth: {
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    processing: "Processing...",
    login: {
      title: "Welcome back",
      description: "Log in to continue to your dashboard.",
      submit: "Log in",
      alternatePrompt: "New here?",
      alternateLink: "Create an account",
    },
    register: {
      title: "Create your account",
      description: "Start with your email address and a secure password.",
      submit: "Create account",
      alternatePrompt: "Already have an account?",
      alternateLink: "Log in",
      success:
        "If an account can be created with this email address, check your inbox to continue.",
    },
    error: {
      title: "We could not complete authentication",
      description:
        "The confirmation link is missing, invalid, or expired. Please return to registration and try again.",
      backToRegister: "Back to registration",
    },
    validation: {
      invalidEmail: "Enter a valid email address.",
      invalidPassword: "Password must be between 8 and 128 characters.",
    },
    failure: {
      login: "The email address or password is incorrect.",
      register: "We could not create the account right now. Please try again.",
    },
  },
  onboarding: {
    eyebrow: "Your profile",
    title: "Choose how you will appear",
    description:
      "Set up the basic profile that will become the foundation of your page.",
    usernameLabel: "Username",
    usernameHint: "3-30 lowercase letters, numbers, or underscores.",
    usernamePlaceholder: "your_name",
    displayNameLabel: "Display name",
    displayNamePlaceholder: "Your name",
    bioLabel: "Bio",
    bioOptional: "Optional",
    bioPlaceholder: "A short introduction about you.",
    submit: "Create profile",
    processing: "Processing...",
    validation: {
      username:
        "Use 3-30 lowercase letters, numbers, or underscores, starting with a letter or number.",
      displayName:
        "Display name is required and must be 80 characters or fewer.",
      bio: "Bio must be 280 characters or fewer.",
    },
    failure: {
      authentication: "Your session has expired. Please log in again.",
      load: "We could not load your profile right now. Please try again.",
      create: "We could not create your profile right now. Please try again.",
      usernameUnavailable:
        "This username is not available. Please choose another one.",
    },
  },
  dashboard: {
    eyebrow: "Dashboard",
    titlePrefix: "Welcome",
    linksComingSoon: "Link management will be added next.",
    logout: "Log out",
  },
} as const;
