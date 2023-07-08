import VariableOptions from "gql-query-builder/build/VariableOptions";

export function createTransform({
  mapping = {},
}: {
  mapping?: Record<string, string | Pick<VariableOptions, "list" | "type">>;
}): (vars: Record<string, unknown>) => Record<string, VariableOptions> {
  const mappedKeys = Object.keys(mapping);

  return (vars) => {
    const res: Record<string, VariableOptions> = {};

    for (const key in vars) {
      const val = vars[key];

      if (mappedKeys.includes(key)) {
        const mappedVal = mapping[key];
        if (typeof mappedVal === "string") {
          res[key] = {
            value: val,
            type: mappedVal,
          };
        } else {
          res[key] = {
            value: val,
            ...mappedVal,
          };
        }

        continue;
      }

      if (Array.isArray(val)) {
        if (val.length > 0) {
          if (typeof val[0] === "number") {
            res[key] = {
              value: val,
              list: true,
              type: "Int",
            };

            continue;
          }
        }
      }

      if (typeof val === "string") {
        res[key] = {
          value: val,
          type: "String",
        };
      }

      if (typeof val === "number") {
        res[key] = {
          value: val,
          type: "Int",
        };
      }
    }

    return res;
  };
}
