import {Schema} from "@hapi/joi";
import {HookContext} from "@feathersjs/feathers";
import {BadRequest} from "@feathersjs/errors";

export function validateJoiSchema(schema: Schema) {
  return (context: HookContext) => {
    const { error, value } = schema.validate(context.data)
    if (error) {
      throw new BadRequest(error)
    }

    context.data = value

    return context
  }
}
