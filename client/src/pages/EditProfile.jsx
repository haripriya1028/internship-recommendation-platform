import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    branch: "",
    year: "",
    cgpa: "",
    skills: "",
    interests: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const response = await API.get(`/profile/${userId}`);

      setFormData({
        branch: response.data.branch,
        year: response.data.year,
        cgpa: response.data.cgpa,
        skills: response.data.skills.join(", "),
        interests: response.data.interests.join(", "),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem("userId");

      await API.put(`/profile/${userId}`, {
        branch: formData.branch,
        year: Number(formData.year),
        cgpa: Number(formData.cgpa),
        skills: formData.skills
          .split(",")
          .map((item) => item.trim()),
        interests: formData.interests
          .split(",")
          .map((item) => item.trim()),
      });

      alert("Profile Updated!");

      navigate("/profile");
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <h1 className="text-3xl font-semibold text-slate-900">
            Update Profile
          </h1>

          <form
            onSubmit={handleUpdate}
            className="mt-8 grid gap-5 sm:grid-cols-2"
          >
          <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Branch</label>
                <input
                  type="text"
                  name="branch"
                  placeholder="Computer Science"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Year</label>
                <input
                  type="number"
                  name="year"
                  placeholder="3"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  name="cgpa"
                  placeholder="8.7"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Skills</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="Python, React, MongoDB"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Interests</label>
                <input
                  type="text"
                  name="interests"
                  placeholder="Machine Learning, Web Development"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Update profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}

export default EditProfile;