import { useEffect, useState } from "react";
import API from "../services/api";

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await API.get(`/recommendations/${userId}`);
      setRecommendations(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getScoreStyles = (score) => {
    if (score >= 80) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }
    if (score >= 60) {
      return "bg-amber-50 text-amber-700 ring-amber-200";
    }
    return "bg-rose-50 text-rose-700 ring-rose-200";
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Matches</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Recommended internships</h1>
          </div>
          <div className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            {recommendations.length} opportunities found
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">No recommendations found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((internship) => (
              <article
                key={internship._id}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Opportunity</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{internship.title}</h2>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getScoreStyles(internship.matchScore)}`}>
                    {internship.matchScore}%
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-800">{internship.company}</span>
                  <span>•</span>
                  <span>{internship.location}</span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {internship.description}
                </p>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Skills required</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(internship.skillsRequired || []).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600 ring-1 ring-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;