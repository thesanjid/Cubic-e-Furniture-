import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const empty = {
  name: "",
  category: "",
  price: "",
  discountPrice: "",
  stock: "",
  brand: "Cubic",
  material: "",
  color: "",
  dimensions: "",
  shortDescription: "",
  description: "",
  featured: false,
  images: [],
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    if (isEdit) {
      api.get(`/products/id/${id}`).then((res) => {
        const p = res.data;
        setForm({
          ...p,
          category: p.category?._id || p.category,
        });
      });
    }
  }, [id]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    setUploading(true);
    try {
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((f) => ({ ...f, images: [...f.images, ...data.paths] }));
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      stock: Number(form.stock),
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    }
  };

  return (
    <div>
      <h2>{isEdit ? "Edit Product" : "Add Product"}</h2>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={submit} style={{ maxWidth: 700 }}>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Price (৳)</label>
            <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Discount Price (optional)</label>
            <input type="number" min={0} value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Stock</label>
            <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Material</label>
            <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Color</label>
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Dimensions</label>
            <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>Short Description</label>
          <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Full Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="form-group">
          <label>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured product
          </label>
        </div>

        <div className="form-group">
          <label>Images</label>
          <input type="file" multiple accept="image/*" onChange={handleUpload} />
          {uploading && <p>Uploading...</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            {form.images.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={img} alt="" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{ position: "absolute", top: -6, right: -6, background: "var(--danger)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            You can also paste direct image URLs by editing the images array via the API if preferred.
          </p>
        </div>

        <button className="btn btn-primary" type="submit">{isEdit ? "Update Product" : "Create Product"}</button>
      </form>
    </div>
  );
}
