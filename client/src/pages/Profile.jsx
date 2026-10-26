import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Profile() {
  const studentName = localStorage.getItem("name");
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState(null);
  
    
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
    setProfile(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      setProfile("NOT_FOUND");
    } else if (error.response?.status === 401) {
      localStorage.clear();
      navigate("/login");
    } else {
      console.error("Failed to load profile:", error);
      setLoadError(
        error.response?.data?.message ||
          "Something went wrong loading your profile. Please try again."
      );
    }
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem("userId");

      await API.post("/profile", {
        user: userId,
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

      alert("Profile Created!");
      fetchProfile();
    } catch (error) {
      console.log(error);
      alert("Failed to create profile");
    }
  };
  
    if (loadError) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-red-600">{loadError}</p>
            <button
              onClick={() => {
                setLoadError(null);
                fetchProfile();
              }}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-5/6 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profile === "NOT_FOUND") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
                Complete your profile
              </span>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">Tell us about yourself</h1>
              <p className="mt-2 text-sm text-slate-500">This helps us personalize your internship matches.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
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
                  Save profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-xl font-semibold text-white">
                {profile.branch ? profile.branch.charAt(0) : "S"}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Student profile</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">{studentName}</h1>
              </div>
            </div>
            <div className="flex gap-3">
            <button
              onClick={() => navigate("/recommendations")}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              View recommendations
            </button>
            <button
                onClick={() => navigate("/edit-profile")}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                Edit Profile
            </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Branch</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{profile.branch}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Year</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{profile.year}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">CGPA</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{profile.cgpa}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Skills</h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-semibold text-slate-900">Interests</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span key={index} className="inline-flex rounded-full bg-white px-3 py-1 text-sm text-slate-600 ring-1 ring-slate-200">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;