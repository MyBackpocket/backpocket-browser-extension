import { useEffect, useState } from "react";
import { ApiError, createSave, listTags } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Tag } from "../lib/types";
import { TagInput } from "./TagInput";

type SaveState = "idle" | "loading" | "success" | "error";

export function SaveForm() {
  const { getToken } = useAuth();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<Tag[]>([]);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [tagsLoading, setTagsLoading] = useState(true);

  // Fetch current tab info and tags on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional run-once on mount
  useEffect(() => {
    // Get current tab URL and title
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        if (tabs[0]) {
          setUrl(tabs[0].url || "");
          setTitle(tabs[0].title || "");
        }
      })
      .catch(console.error);

    // Fetch existing tags for autocomplete
    fetchTags();
  }, []);

  async function fetchTags() {
    setTagsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setTagsLoading(false);
        return;
      }
      const tagList = await listTags(token);
      setExistingTags(tagList);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setTagsLoading(false);
    }
  }

  async function handleSave() {
    if (!url) return;

    setSaveState("loading");
    setErrorMessage("");

    try {
      const token = await getToken();
      if (!token) {
        throw new ApiError("Not authenticated", "UNAUTHORIZED");
      }

      await createSave(
        {
          url,
          title: title || undefined,
          tagNames: tags.length > 0 ? tags : undefined,
          visibility: "private",
        },
        token
      );

      setSaveState("success");

      // Auto-close popup after success
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveState("error");
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to save link");
      }
    }
  }

  // Success state
  if (saveState === "success") {
    return (
      <div className="save-success">
        <div className="success-icon">✓</div>
        <p>Saved to Backpocket!</p>
      </div>
    );
  }

  const isLoading = saveState === "loading";

  return (
    <div className="save-form">
      <div className="form-group">
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled
          className="input-url"
        />
      </div>

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional title"
          disabled={isLoading}
          className="input-title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <TagInput
          id="tags"
          value={tags}
          onChange={setTags}
          suggestions={existingTags.map((t) => t.name)}
          placeholder={tagsLoading ? "Loading tags..." : "Add tags..."}
          disabled={isLoading}
        />
      </div>

      {saveState === "error" && <div className="error-message">{errorMessage}</div>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isLoading || !url}
        className="save-button"
      >
        {isLoading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
