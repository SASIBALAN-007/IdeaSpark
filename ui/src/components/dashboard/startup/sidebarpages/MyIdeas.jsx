import { useEffect, useState } from "react";
import { Pencil, Trash2, X, Save, FolderOpen, Plus } from "lucide-react";

const API = "/api";

const initialForm = {
  title: "",
  shortDescription: "",
  problemStatement: "",
  solution: "",
  domain: "",
  targetConsumers: "",
  businessModel: "",
  stage: "Idea",
  fundingRequired: 0,
  location: "",
};

function StartupProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isFormOpen = isCreating || Boolean(editingId);

  // Fetch startup projects
  async function fetchProjects() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/startup/ideas`, {
        method: "GET",
        credentials: "include",
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load projects");
      }

      setProjects(data?.projects || data?.ideas || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  // Open the create form (used by the button and by the global event)
  function startCreating() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Keep supporting the old "open-create-project" event from other components
  useEffect(() => {
    window.addEventListener("open-create-project", startCreating);
    return () =>
      window.removeEventListener("open-create-project", startCreating);
  }, []);

  function startEditing(project) {
    setIsCreating(false);
    setEditingId(project._id);
    setSuccess("");
    setError("");

    setForm({
      title: project.title || "",
      shortDescription: project.shortDescription || "",
      problemStatement: project.problemStatement || "",
      solution: project.solution || "",
      domain: project.domain || "",
      targetConsumers: Array.isArray(project.targetConsumers)
        ? project.targetConsumers.join(", ")
        : "",
      businessModel: project.businessModel || "",
      stage: project.stage || "Idea",
      fundingRequired: project.fundingRequired ?? 0,
      location: project.location || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setEditingId(null);
    setIsCreating(false);
    setForm(initialForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // Create (POST) or update (PATCH) depending on the mode
  async function handleSubmit(event) {
  event.preventDefault();

  if (!isCreating && !editingId) return;

  setSaving(true);
  setError("");
  setSuccess("");

  const payload = {
    ...form,
    fundingRequired: Number(form.fundingRequired),
    targetConsumers: form.targetConsumers
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };

  const creating = isCreating;
  const url = creating
    ? `${API}/startup/ideas`
    : `${API}/startup/ideas/${editingId}`;

  try {
    const response = await fetch(url, {
      method: creating ? "POST" : "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data = null;
    let rawText = "";

    try {
      rawText = await response.text();
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      console.error("Save failed:", {
        url,
        status: response.status,
        response: data || rawText,
        payload,
      });

      const detail =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors)
          ? data.errors.map((e) => e.msg || e.message || e).join(", ")
          : "") ||
        `Request failed (${response.status})`;

      throw new Error(detail);
    }

    const savedProject = data?.project || data?.idea;

    if (savedProject) {
      if (creating) {
        setProjects((current) => [savedProject, ...current]);
      } else {
        setProjects((current) =>
          current.map((project) =>
            project._id === editingId ? savedProject : project
          )
        );
      }
    } else {
      await fetchProjects();
    }

    closeForm();
    setSuccess(
      creating
        ? "Project created successfully!"
        : "Project updated successfully!"
    );
  } catch (err) {
    setError(err.message || "Something went wrong");
  } finally {
    setSaving(false);
  }
}
  // Delete project using DELETE API
  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${project.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(project._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API}/startup/ideas/${project._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete project");
      }

      setProjects((current) =>
        current.filter((item) => item._id !== project._id)
      );

      if (editingId === project._id) {
        closeForm();
      }

      setSuccess("Project deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black";

  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              IdeaSpark / Startup
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Projects
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage, update, and track your startup ideas.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus size={17} />
            Create project
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800"
          >
            {success}
          </div>
        )}

        {/* Create / edit form */}
        {isFormOpen && (
          <section className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {isCreating ? "Create project" : "Edit project"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isCreating
                    ? "Fill in the details of your new startup idea."
                    : "Update your project information below."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg border border-gray-300 p-2 hover:bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Project title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={inputClass}
                    required
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className={labelClass}>Domain *</label>
                  <input
                    name="domain"
                    value={form.domain}
                    onChange={handleChange}
                    className={inputClass}
                    required
                    placeholder="e.g. FinTech, Healthcare"
                  />
                </div>

                <div>
                  <label className={labelClass}>Project stage</label>
                  <select
                    name="stage"
                    value={form.stage}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Idea">Idea</option>
                    <option value="Prototype">Prototype</option>
                    <option value="MVP">MVP</option>
                    <option value="Launched">Launched</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Funding required (₹)</label>
                  <input
                    name="fundingRequired"
                    type="number"
                    min="0"
                    value={form.fundingRequired}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="City, country"
                  />
                </div>

                <div>
                  <label className={labelClass}>Target consumers *</label>
                  <input
                    name="targetConsumers"
                    value={form.targetConsumers}
                    onChange={handleChange}
                    className={inputClass}
                    required
                    placeholder="Students, businesses, etc."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple consumers with commas.
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Short description *</label>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  className={inputClass}
                  rows={3}
                  required
                  maxLength={500}
                />
              </div>

              <div>
                <label className={labelClass}>Problem statement *</label>
                <textarea
                  name="problemStatement"
                  value={form.problemStatement}
                  onChange={handleChange}
                  className={inputClass}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Your solution *</label>
                <textarea
                  name="solution"
                  value={form.solution}
                  onChange={handleChange}
                  className={inputClass}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Business model</label>
                <textarea
                  name="businessModel"
                  value={form.businessModel}
                  onChange={handleChange}
                  className={inputClass}
                  rows={2}
                  placeholder="How will your startup generate revenue?"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving
                    ? "Saving..."
                    : isCreating
                    ? "Create project"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Project list */}
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            Loading your projects...
          </div>
        ) : projects.length === 0 ? (
          !isFormOpen && (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
              <FolderOpen className="mx-auto mb-4 text-gray-400" size={40} />
              <h2 className="text-lg font-semibold">No projects yet</h2>
              <p className="mt-2 text-sm text-gray-500">
                Create your first startup project to see it here.
              </p>
              <button
                type="button"
                onClick={startCreating}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <Plus size={17} />
                Create project
              </button>
            </div>
          )
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </p>

              <button
                type="button"
                onClick={fetchProjects}
                className="text-sm font-medium underline underline-offset-4 hover:text-gray-500"
              >
                Refresh
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project._id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-block rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600">
                        {project.domain || "Startup"}
                      </span>

                      <h2 className="mt-3 break-words text-xl font-semibold">
                        {project.title}
                      </h2>
                    </div>

                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                      {project.stage || "Idea"}
                    </span>
                  </div>

                  <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-600">
                    {project.shortDescription}
                  </p>

                  <div className="mb-5 space-y-3 border-t border-gray-100 pt-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Funding required</p>
                      <p className="mt-1 font-semibold">
                        ₹
                        {Number(project.fundingRequired || 0).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    {project.location && (
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="mt-1">{project.location}</p>
                      </div>
                    )}

                    {project.targetConsumers?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">
                          Target consumers
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.targetConsumers.map((consumer, index) => (
                            <span
                              key={`${consumer}-${index}`}
                              className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            >
                              {consumer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex gap-3 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => startEditing(project)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(project)}
                      disabled={deletingId === project._id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      {deletingId === project._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default StartupProjects;