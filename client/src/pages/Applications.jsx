import { useEffect, useState } from "react";
import API from "../services/api";

const STATUS_OPTIONS = [
  "viewed",
  "applied",
  "in progress",
  "accepted",
  "rejected",
];

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      const response = await API.get(`/recommendations/${userId}`);

      const activeApplications = response.data.filter(
        (item) => (item.status || "not viewed") !== "not viewed"
      );

      setApplications(activeApplications);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const removeApplication = async (
    internshipId,
    title,
    company
  ) => {
    try {
      setRemovingId(String(internshipId));
      const userId = localStorage.getItem("userId");

      await API.patch(
        `/recommendations/${userId}/${internshipId}/status`,
        {
          status: "not viewed",
          title,
          company,
        }
      );

      setApplications((prevApplications) =>
        prevApplications.filter(
          (item) => String(item._id) !== String(internshipId)
        )
      );
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          "Failed to remove application. Please try again."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const updateStatus = async (
    internshipId,
    status,
    title,
    company
  ) => {
    try {
      const userId = localStorage.getItem("userId");

      await API.patch(
        `/recommendations/${userId}/${internshipId}/status`,
        {
          status,
          title,
          company,
        }
      );

      if (status === "not viewed") {
        setApplications((prevApplications) =>
          prevApplications.filter(
            (item) =>
              String(item._id) !== String(internshipId)
          )
        );
        return;
      }

      setApplications((prevApplications) =>
        prevApplications.map((item) =>
          String(item._id) === String(internshipId)
            ? { ...item, status }
            : item
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Tracker
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Current Job Applications
            </h1>
          </div>

          <div className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            {applications.length} active applications
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            <p className="mt-6 text-slate-600">
              Loading applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              No active applications yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((application) => (
              <article
                key={application._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-slate-900">
                  {application.title}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-800">
                    {application.company}
                  </span>
                  <span>•</span>
                  <span>{application.location}</span>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </p>
                  <select
                    value={application.status || "viewed"}
                    onChange={(e) =>
                      updateStatus(
                        application._id,
                        e.target.value,
                        application.title,
                        application.company
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option
                        key={statusOption}
                        value={statusOption}
                      >
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 grid gap-3">
                  {application.link ? (
                    <a
                      href={application.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open Link
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      removeApplication(
                        application._id,
                        application.title,
                        application.company
                      )
                    }
                    disabled={
                      removingId === String(application._id)
                    }
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingId === String(application._id)
                      ? "Removing..."
                      : "Remove from Applications"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;
