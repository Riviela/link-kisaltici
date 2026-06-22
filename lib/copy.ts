import { APP_NAME } from "@/lib/config/site";

export const copy = {
  metadata: {
    title: APP_NAME,
    description: "A focused home for the links that matter.",
  },
  navigation: {
    login: "Log in",
    register: "Sign up free",
    dashboard: "Dashboard",
  },
  home: {
    eyebrow: "Your online presence, in one place",
    title: "Make every link feel intentional.",
    description:
      "Create a simple home for your work, ideas, and the places people can find you online.",
    signup: {
      cta: "Get started for free",
      label: "Choose your username",
      placeholder: "yourname",
      error:
        "Use 3-30 lowercase letters, numbers, or underscores, starting with a letter or number.",
    },
  },
  auth: {
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    processing: "Processing...",
    visual: {
      title: "Creative notes",
      username: "@canvas",
      firstLink: "Selected work",
      secondLink: "Writing notes",
    },
    login: {
      title: "Welcome back",
      description: "Log in to continue to your dashboard.",
      submit: "Log in",
      alternatePrompt: `New to ${APP_NAME}?`,
      alternateLink: "Sign up free",
    },
    register: {
      title: `Join ${APP_NAME}`,
      titleWithUsername: (username: string) =>
        `Join ${APP_NAME} with @${username}`,
      description: "Set up your profile in a few focused steps.",
      submit: `Join ${APP_NAME}`,
      continue: "Continue",
      back: "Back",
      stepLabel: "Step",
      emailStep: {
        title: "What is your email?",
        description: "We will send a verification link to this address.",
      },
      usernameStep: {
        title: "Choose your profile URL",
        description: "Pick the address people will use to find your profile.",
        label: "Profile URL",
        hint: "You can change this before your profile is created.",
      },
      passwordStep: {
        title: "Create a password",
        description: "Use at least 8 characters to protect your account.",
        confirmLabel: "Confirm password",
        confirmPlaceholder: "Enter your password again",
      },
      alternatePrompt: "Already have an account?",
      alternateLink: "Log in",
      success:
        "If an account can be created with this email, check your inbox to verify your email address.",
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
      passwordMismatch: "Passwords do not match.",
      invalidUsername:
        "Use 3-30 lowercase letters, numbers, or underscores, starting with a letter or number.",
    },
    failure: {
      login: "The email address or password is incorrect.",
      register: "We could not complete this request. Please try again.",
    },
  },
  onboarding: {
    eyebrow: "Your profile",
    title: "Choose how you will appear",
    description:
      "Set up the basic profile that will become the foundation of your page.",
    usernameLabel: "Username",
    usernameFallbackLabel: "Choose another username",
    usernameHint: "3-30 lowercase letters, numbers, or underscores.",
    usernamePlaceholder: "yourname",
    usernamePreview: "yourdomain.com/yourname",
    profileUrlLabel: "Your profile URL",
    profileUrlHint: "This is the address you selected during registration.",
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
        "This profile URL is no longer available. Choose another one.",
    },
  },
  dashboard: {
    eyebrow: "Dashboard",
    titlePrefix: "Welcome",
    content: "Content",
    preview: "Live preview",
    logout: "Log out",
  },
  profileVisibility: {
    published: "Published",
    private: "Private",
    publish: "Publish profile",
    unpublish: "Unpublish profile",
    processing: "Processing...",
    success: {
      published: "Your profile is now public.",
      private: "Your profile is now private.",
    },
    failure: {
      authentication: "Your session has expired. Please log in again.",
      update: "We could not update profile visibility. Please try again.",
    },
  },
  publicProfile: {
    empty: "No links have been published yet.",
    failure: {
      load: "We could not load this profile right now.",
    },
  },
  notFound: {
    title: "Profile not found",
    description: "This profile is unavailable or has not been published.",
    home: "Return home",
  },
  links: {
    eyebrow: "Your links",
    title: "Manage your links",
    description: "Add, edit, publish, and reorder the links on your profile.",
    listTitle: "Your links",
    empty: "No links yet. Add your first link above.",
    titleLabel: "Title",
    titlePlaceholder: "Portfolio",
    urlLabel: "URL",
    urlPlaceholder: "https://example.com",
    activeLabel: "Active",
    add: "Add link",
    save: "Save changes",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    processing: "Processing...",
    saving: "Saving...",
    dragHandle: "Drag to reorder",
    deleteConfirm: "Delete this link?",
    active: "Active",
    inactive: "Inactive",
    validation: {
      title: "Title is required and must be 120 characters or fewer.",
      url: "Enter a valid http, https, mailto, or tel URL without spaces.",
    },
    success: {
      created: "Your link was added.",
      updated: "Your link was updated.",
      deleted: "Your link was deleted.",
    },
    failure: {
      authentication: "Your session has expired. Please log in again.",
      load: "We could not load your links right now. Please try again.",
      invalid: "The link information is invalid.",
      create: "We could not add this link. Please try again.",
      update: "We could not update this link. Please try again.",
      toggle: "We could not change this link. Please try again.",
      delete: "We could not delete this link. Please try again.",
      reorder: "We could not save the new order. Please try again.",
      reorderRestored:
        "We could not save the new order. The latest saved order has been restored.",
    },
  },
} as const;
