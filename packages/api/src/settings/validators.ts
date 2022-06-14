import { SettingDocument } from 'types/dist/settings/types';
import { PeriodSettingDocument } from 'types/dist/periodsettings/types';
import { Validator } from 'jsonschema';

const QuestionAnswerJSONSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        required: true,
      },
      questions: {
        type: 'array',
        required: true,
        properties: {
          question: { type: 'string', required: true },
          answer: { type: 'string', required: true },
        },
      },
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNumeric(num: any): Boolean {
  return !isNaN(num);
}

export function fieldTypeValidator(
  this: SettingDocument | PeriodSettingDocument
): Boolean {
  if (this.type === 'Float' || this.type === 'Integer') {
    return isNumeric(this.value);
  }

  if (this.type === 'QuestionAnswerJSON') {
    const v = new Validator();

    const faq = JSON.parse(this.value);
    if (!faq) {
      return false;
    }

    const validation = v.validate(faq, QuestionAnswerJSONSchema);

    return validation.errors.length === 0;
  }

  if (
    this.type === 'String' ||
    this.type === 'Textarea' ||
    this.type === 'Image'
  ) {
    return typeof this.value === 'string';
  }

  if (this.type === 'Boolean') {
    return this.value === 'true' || this.value === 'false';
  }

  if (this.type === 'IntegerList') {
    let valid = true;
    let previous = 0;
    const valueArray = this.value.split(',').map((item) => item.trim());

    valueArray.forEach((element) => {
      if (!isNumeric(element) || parseInt(element) < previous) {
        valid = false;
      }

      previous = parseInt(element);
    });

    return valid;
  }

  return typeof this.value === this.type;
}
