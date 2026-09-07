import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get("/categories").then((res) => setCategories(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
      } else {
        await api.post("/categories", { name });
      }
      setName("");
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const edit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div>
      <h2>Categories</h2>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={submit} style={{ display: "flex", gap: 10, marginBottom: 20, maxWidth: 400 }}>
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: 1, padding: 10, border: "1px solid var(--border)", borderRadius: 6 }}
        />
        <button className="btn btn-primary" type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && (
          <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setName(""); }}>
            Cancel
          </button>
        )}
      </form>

      <table className="admin-table">
        <thead><tr><th>Name</th><th>Slug</th><th></th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-outline" onClick={() => edit(c)}>Edit</button>
                <button className="btn btn-danger" onClick={() => remove(c._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
