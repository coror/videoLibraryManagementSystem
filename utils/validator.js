const createUserValidator = {
  fields: {
    name: {
      required: true,
      type: String,
      options: (val) => {
        return val.length !== 0;
      },
      error: "Name field is required.",
    },
    surname: {
      required: true,
      type: String,
      options: (val) => {
        return val.length !== 0;
      },
      error: "Surname field is required.",
    },
    password: {
      required: true,
      type: String,
      options: (val) => {
        const passwordRegex =
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(val) || val.includes("password")) {
          return false; // Validation failed
        }
        return true; // Validation passed
      },
      error:
        "Password must be at least 8 character long, have 1 uppercase, have 1 number, 1 specialcharacter and it cannot contain the word 'password'",
    },
    phoneNumber: {
      required: true,
      type: String,
      options: (val) => {
        // Regular expression to check if the input contains only numeric characters
        const numericRegex = /^\d+$/;
        return numericRegex.test(val);
      },
      error: "Please provide a valid phone number",
    },
  },
};

const updateUserValidator = {
  fields: {
    password: {
      required: false,
      type: String,
      options: (val) => {
        const passwordRegex =
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(val) || val.includes("password")) {
          return false; // Validation failed
        }
        return true; // Validation passed
      },
      error:
        "Password must be at least 8 character long, have 1 uppercase, have 1 number, 1 specialcharacter and it cannot contain the word 'password'",
    },
    phoneNumber: {
      required: false,
      type: String,
      options: (val) => {
        // Regular expression to check if the input contains only numeric characters
        const numericRegex = /^\d+$/;
        return numericRegex.test(val);
      },
      error: "Please provide a valid phone number",
    },
  },
};

// const uploadAvatarValidator = {
//   fields: {
//     data: {
//       required: true,
//       type: String,
//       options: (val) => {
//         // Define your base64 data validation logic here
//         const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;
//         return base64Regex.test(val);
//       },
//       error:
//         "Invalid base64 data. Please provide a valid base64-encoded image.",
//     },
//   },
// };

const createCommentValidator = {
  fields: {
    content: {
      required: true,
      type: String,
      options: (val) => {
        return val.length <= 150;
      },
      error: "Comment length cannot be more than 150 chatacters long.",
    },
  },
};

const editCommentValidator = {
  fields: {
    content: {
      required: true,
      type: String,
      options: (val) => {
        return val.length <= 150;
      },
      error: "Comment length cannot be more than 150 chatacters long.",
    },
  },
};

const uploadVideoValidator = {
  fields: {
    title: {
      required: true,
      type: String,
      options: (val) => {
        return val.length !== 0 && val.length <= 30;
      },
      error:
        "Title field cannot be empty and cannot be longer than 30 characters.",
    },
    description: {
      required: true,
      type: String,
      options: (val) => {
        return val.length <= 300;
      },
      error: "Description cannot be longer than 300 characters.",
    },
    category: {
      required: true,
      type: String,
      options: (val) => {
        const validCategories = [
          "horror",
          "sci-fi",
          "comedy",
          "drama",
          "action",
          "romance",
          "thriller",
          "adventure",
          "animation",
          "fantasy",
          "mystery",
          "crime",
        ];

        const lowerCaseVal = val.toLowerCase();
        return validCategories.includes(lowerCaseVal);
      },
      error: "Invalid category. Please choose a valid category",
    },
    // data: {
    //   required: true,
    //   type: String,
    //   options: (val) => {
    //     const isBase64Data = isBase64(val);
    //     console.log("Is base64:", isBase64Data);
    //     return isBase64Data;
    //   },
    //   error:
    //     "Invalid base64 data. Please provide a valid base64-encoded video.",
    // },
  },
};

const updateVideoValidator = {
  fields: {
    title: {
      required: false,
      type: String,
      options: (val) => {
        return val.length !== 0 && val.length <= 30;
      },
      error:
        "Title field cannot be empty and cannot be longer than 30 characters.",
    },
    description: {
      required: false,
      type: String,
      options: (val) => {
        return val.length <= 300;
      },
      error: "Description cannot be longer than 300 characters.",
    },
    category: {
      required: false,
      type: String,
      options: (val) => {
        const validCategories = [
          "horror",
          "sci-fi",
          "comedy",
          "drama",
          "action",
          "romance",
          "thriller",
          "adventure",
          "animation",
          "fantasy",
          "mystery",
          "crime",
        ];

        const lowerCaseVal = val.toLowerCase();
        return validCategories.includes(lowerCaseVal);
      },
      error: "Invalid category. Please choose a valid category",
    },
  },
};

module.exports = {
  createUserValidator,
  uploadAvatarValidator,
  createCommentValidator,
  uploadVideoValidator,
  updateUserValidator,
  updateVideoValidator,
  editCommentValidator,
};
