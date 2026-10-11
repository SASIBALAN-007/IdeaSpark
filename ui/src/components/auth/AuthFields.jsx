
export function getAuthFields(role, mode) {
  const fields = [];

  if (mode === "signup") {
    if (role === "startup") {
      fields.push(
        {
          key: "companyName",
          label: "Company name",
          type: "text",
          required: true,
        },
        {
          key: "founderName",
          label: "Founder name",
          type: "text",
          required: true,
        }
      );
    } else {
      fields.push(
        {
          key: "fullName",
          label: "Full name",
          type: "text",
          required: true,
        },
        {
          key: "firmName",
          label: "Firm name",
          type: "text",
        }
      );
    }
  }

  fields.push(
    {
      key: "email",
      label: "Email",
      type: "email",
      required: true,
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      required: true,
    }
  );

  if (mode === "signup") {
    if (role === "startup") {
      fields.push(
        {
          key: "industry",
          label: "Industry",
          type: "text",
        },
        {
          key: "website",
          label: "Website",
          type: "text",
        }
      );
    } else {
      fields.push({
        key: "investmentFocus",
        label: "Investment focus",
        type: "text",
      });
    }
  }

  return fields;
}

export default function AuthFields({
  fields,
  form,
  onChange,
}) {
  return fields.map((field) => (
    <div key={field.key}>
      <label
        className="mb-1 block text-sm font-medium text-slate-700"
        htmlFor={field.key}
      >
        {field.label}

        {field.required && (
          <span className="text-rose-500"> *</span>
        )}
      </label>

      <input
        id={field.key}
        type={field.type}
        required={field.required}
        value={form[field.key] || ""}
        onChange={onChange(field.key)}
        className="w-full rounded-lg border border-slate-300 px-3 
        py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2
         focus:ring-brand-500"
        placeholder={field.label}
      />
    </div>
  ));
}
