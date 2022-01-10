const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = BaseJoi.extend(extension);

module.exports.campgroundJoiSchema = joi.object({
  campground: joi
    .object({
      name: joi.string().required().escapeHTML(),
      location: joi.string().required().min(0).escapeHTML(),
      price: joi.number().required(),
      description: joi.string().required().escapeHTML(),
    })
    .required(),
});

module.exports.imageJoiSchema = joi.array().items(
  joi
    .object({
      fieldname: joi.string().required(),
      originalname: joi.string().required().escapeHTML(),
      encoding: joi.string().required().escapeHTML(),
      mimetype: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().required(),
      filename: joi.string().required().escapeHTML(),
    })
    .required()
);

module.exports.reviewJoiSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().min(1).max(5).required(),
      body: joi.string().required().escapeHTML(),
    })
    .required(),
});
