import API from "../services/api";

// Opens an internship's application page and marks it "viewed" so it
// shows up under Applications. The server never downgrades a later status.
function ApplicationLink({ internship, onViewed, className = "" }) {
  const handleClick = async () => {
    if (!internship.link) {
      return;
    }

    window.open(internship.link, "_blank", "noopener,noreferrer");

    try {
      const userId = localStorage.getItem("userId");
      const response = await API.patch(
        `/recommendations/${userId}/${internship._id}/status`,
        {
          status: "viewed",
          title: internship.title,
          company: internship.company,
        }
      );
      onViewed?.(internship._id, response.data.status);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!internship.link}
      title={internship.link ? undefined : "No application link available"}
      className={`rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
    >
      {internship.link ? "Apply" : "No link available"}
    </button>
  );
}

export default ApplicationLink;
