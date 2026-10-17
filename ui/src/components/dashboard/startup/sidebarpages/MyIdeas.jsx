
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  X,
  Save,
  FolderOpen,
  Plus,
  FileText,
  Upload,
} from "lucide-react";

const API = "/api";
const MAX_PDF_SIZE = 15 * 1024 * 1024; // 15 MB

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

export default function MyIdeas() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isFormOpen = isCreating || Boolean(editingId);

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-1 focus:ring-black";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700";

  async function fetchProjects() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/startup/ideas`, {
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to load projects");
      }

      setProjects(data.projects || data.ideas || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function startCreating() {
    setEditingId(null);
    setForm({ ...initialForm });
    setPdfFile(null);
    setError("");
    setSuccess("");
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function handleOpenCreate() {
      startCreating();
    }

    window.addEventListener("open-create-project", handleOpenCreate);
    return () =>
      window.removeEventListener("open-create-project", handleOpenCreate);
  }, []);

  function startEditing(project) {
    setIsCreating(false);
    setEditingId(project._id);
    setPdfFile(null);
    setError("");
    setSuccess("");

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
    setForm({ ...initialForm });
    setPdfFile(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handlePDFChange(event) {
    const file = event.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) {
      setPdfFile(null);
      return;
    }

    // Check both extension and MIME type.
    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setPdfFile(null);
      event.target.value = "";
      setError("Please select a valid PDF file.");
      return;
    }

    // Requirement: strictly smaller than 15 MB.
    if (file.size >= MAX_PDF_SIZE) {
      setPdfFile(null);
      event.target.value = "";
      setError("The PDF must be smaller than 15 MB.");
      return;
    }

    setPdfFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isCreating && !editingId) return;

    if (form.targetConsumers.split(",").every((item) => !item.trim())) {
      setError("Please enter at least one target consumer group.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const creating = isCreating;
    const url = creating
      ? `${API}/startup/ideas`
      : `${API}/startup/ideas/${editingId}`;

    // Send multipart/form-data so the PDF can be uploaded.
    const payload = new FormData();

    payload.append("title", form.title.trim());
    payload.append("shortDescription", form.shortDescription.trim());
    payload.append("problemStatement", form.problemStatement.trim());
    payload.append("solution", form.solution.trim());
    payload.append("domain", form.domain.trim());
    payload.append(
      "targetConsumers",
      JSON.stringify(
        form.targetConsumers
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
    payload.append("businessModel", form.businessModel.trim());
    payload.append("stage", form.stage);
    payload.append("fundingRequired", String(Number(form.fundingRequired)));
    payload.append("location", form.location.trim());

    if (pdfFile) {
      payload.append("projectDocument", pdfFile);
    }

    try {
      const response = await fetch(url, {
        method: creating ? "POST" : "PATCH",
        credentials: "include",
        body: payload,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to save project");
      }

      const savedProject = data.project || data.idea;

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

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Permanently delete "${project.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(project._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API}/startup/ideas/${project._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete project");
      }

      setProjects((current) =>
        current.filter((item) => item._id !== project._id)
      );

      if (editingId === project._id) closeForm();

      setSuccess("Project deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  // Supports either a populated document object or an ObjectId reference.
  function hasPDF(project) {
    return Boolean(
      project.projectDocument &&
      (
        typeof project.projectDocument === "object"
          ? project.projectDocument._id || project.projectDocument.filename
          : true
      )
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              IdeaSpark / Startup
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Projects
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage startup ideas and upload your PDF pitch deck.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={17} />
            Create project
          </button>
        </header>

        {error && (
          <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
            {success}
          </div>
        )}

        {isFormOpen && (
          <section className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {isCreating ? "Create project" : "Edit project"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isCreating
                    ? "Add your startup details and pitch deck."
                    : "Update your details or upload a replacement pitch deck."}
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
                    placeholder="FinTech, Healthcare..."
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
                    placeholder="Students, businesses..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate groups with commas.
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

              {/* PDF upload */}
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5">
                <label className={labelClass}>
                  Pitch deck / Project document (PDF)
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 px-4 py-6 text-center transition hover:bg-gray-50">
                  <Upload size={25} className="mb-2 text-gray-600" />
                  <span className="text-sm font-medium">
                    Click to select a PDF
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    PDF only · Smaller than 15 MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePDFChange}
                    className="sr-only"
                  />
                </label>

                {pdfFile ? (
                  <div className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <FileText size={22} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="rounded-md p-1 text-gray-500 hover:bg-gray-200"
                      aria-label="Remove selected PDF"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  editingId && hasPDF(
                    projects.find((project) => project._id === editingId) || {}
                  ) && (
                    <p className="mt-3 text-sm text-gray-600">
                      <FileText size={16} className="mr-2 inline" />
                      A PDF is already attached. Choose another PDF to replace it.
                    </p>
                  )
                )}
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
                Create your first startup project.
              </p>
              <button
                type="button"
                onClick={startCreating}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
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
                {projects.length} {projects.length === 1 ? "project" : "projects"}
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
                        ₹{Number(project.fundingRequired || 0).toLocaleString("en-IN")}
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
                        <p className="text-xs text-gray-500">Target consumers</p>
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

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                      <FileText size={17} />
                      <span className="text-sm">
                        {hasPDF(project) ? "PDF attached" : "No PDF uploaded"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Review status: {project.reviewStatus || "Pending"}
                    </p>
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
