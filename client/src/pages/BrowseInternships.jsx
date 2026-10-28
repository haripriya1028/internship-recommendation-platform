import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import ApplicationLink from "../components/ApplicationLink";

const getValues = (internships, field) =>
  [...new Set(
    internships.flatMap((internship) => {
      const value = internship[field];
      return Array.isArray(value)
        ? value.filter((item) => typeof item === "string" && item.trim())
        : typeof value === "string" && value.trim()
          ? [value]
          : [];
    })
  )].sort((first, second) => first.localeCompare(second));

const getAllInternships = async () => {
  const response = await API.get("/internships");
  if (!Array.isArray(response.data)) {
    throw new Error("The server returned an invalid internship list.");
  }
  return response.data;
};

const getErrorMessage = (fetchError) =>
  fetchError.response?.data?.message ||
  fetchError.message ||
  "Couldn't load internships. Please try again.";

function BrowseInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [cgpa, setCgpa] = useState("");

  const fetchInternships = async () => {
    setLoading(true);
    setError("");

    try {
      setInternships(await getAllInternships());
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    getAllInternships()
      .then((data) => {
        if (mounted) setInternships(data);
      })
      .catch((fetchError) => {
        if (mounted) setError(getErrorMessage(fetchError));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const skills = useMemo(() => getValues(internships, "skillsRequired"), [internships]);
  const locations = useMemo(() => getValues(internships, "location"), [internships]);
  const branches = useMemo(() => getValues(internships, "eligibleBranches"), [internships]);
  const companies = useMemo(() => getValues(internships, "company"), [internships]);

  const filteredInternships = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase();
    const selectedSkill = skill.toLocaleLowerCase();
    const selectedLocation = location.toLocaleLowerCase();
    const selectedBranch = branch.toLocaleLowerCase();
    const selectedCompany = company.toLocaleLowerCase();
    const maximumCgpa = cgpa === "" ? null : Number(cgpa);

    return internships.filter((internship) => {
      const requiredSkills = Array.isArray(internship.skillsRequired)
        ? internship.skillsRequired
        : [];
      const eligibleBranches = Array.isArray(internship.eligibleBranches)
        ? internship.eligibleBranches
        : [];
      const searchableText = [
        internship.title,
        internship.company,
        internship.location,
        internship.description,
        ...requiredSkills,
      ]
        .filter((value) => typeof value === "string")
        .join(" ")
        .toLocaleLowerCase();

      return (
        (!searchTerm || searchableText.includes(searchTerm)) &&
        (!selectedSkill ||
          requiredSkills.some(
            (item) =>
              typeof item === "string" &&
              item.toLocaleLowerCase() === selectedSkill
          )) &&
        (!selectedLocation ||
          (typeof internship.location === "string" &&
            internship.location.toLocaleLowerCase() === selectedLocation)) &&
        (!selectedBranch ||
          eligibleBranches.some(
            (item) =>
              typeof item === "string" &&
              item.toLocaleLowerCase() === selectedBranch
          )) &&
        (!selectedCompany ||
          (typeof internship.company === "string" &&
            internship.company.toLocaleLowerCase() === selectedCompany)) &&
        (maximumCgpa === null ||
          Number(internship.minimumCGPA ?? 0) <= maximumCgpa)
      );
    });
  }, [internships, search, skill, location, branch, company, cgpa]);

  const hasFilters = search || skill || location || branch || company || cgpa;

  const resetFilters = () => {
    setSearch("");
    setSkill("");
    setLocation("");
    setBranch("");
    setCompany("");
    setCgpa("");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Explore opportunities
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Browse Internships
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Search all available internships and narrow them down to what fits you.
            </p>
          </div>
          <div className="inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-sm text-slate-600 ring-1 ring-slate-200">
            {filteredInternships.length}{" "}
            {filteredInternships.length === 1 ? "opportunity" : "opportunities"} found
          </div>
        </div>

        <section
          aria-label="Search and filter internships"
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="sm:col-span-2 lg:col-span-3">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Search internships
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Title, company, skills, description, or location"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <FilterSelect label="Skill" value={skill} onChange={setSkill} options={skills} />
            <FilterSelect
              label="Location"
              value={location}
              onChange={setLocation}
              options={locations}
            />
            <FilterSelect
              label="Eligible branch"
              value={branch}
              onChange={setBranch}
              options={branches}
            />
            <FilterSelect
              label="Company"
              value={company}
              onChange={setCompany}
              options={companies}
            />
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Eligible up to CGPA
              </span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={cgpa}
                onChange={(event) => setCgpa(event.target.value)}
                placeholder="e.g. 8.0"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasFilters}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-6 text-slate-600">Loading internships...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchInternships}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              {internships.length === 0
                ? "No internships are available yet."
                : "No internships match your search."}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredInternships.map((internship) => {
              const requiredSkills = Array.isArray(internship.skillsRequired)
                ? internship.skillsRequired.filter(
                    (item) => typeof item === "string" && item.trim()
                  )
                : [];
              const eligibleBranches = Array.isArray(internship.eligibleBranches)
                ? internship.eligibleBranches.filter(
                    (item) => typeof item === "string" && item.trim()
                  )
                : [];

              return (
                <article
                  key={internship._id}
                  className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
                >
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      {internship.company || "Company not specified"}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {internship.title || "Internship"}
                    </h2>
                    <p className="mt-3 text-sm text-slate-500">
                      {internship.location || "Location not specified"}
                    </p>
                  </div>

                  {internship.description && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {internship.description}
                    </p>
                  )}

                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Skills required
                    </p>
                    {requiredSkills.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {requiredSkills.map((item) => (
                          <span
                            key={item}
                            className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600 ring-1 ring-slate-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">Not specified</p>
                    )}
                  </div>

                  <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                    <div>
                      <dt className="font-medium text-slate-700">Minimum CGPA</dt>
                      <dd className="mt-1 text-slate-600">
                        {internship.minimumCGPA ?? "Not specified"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700">Eligible branches</dt>
                      <dd className="mt-1 text-slate-600">
                        {eligibleBranches.length > 0
                          ? eligibleBranches.join(", ")
                          : "Not specified"}
                      </dd>
                    </div>
                  </dl>

                  <ApplicationLink internship={internship} className="mt-5 w-full" />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        <option value="">
          All{" "}
          {label === "Eligible branch"
            ? "branches"
            : label === "Company"
              ? "companies"
              : `${label.toLocaleLowerCase()}s`}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default BrowseInternships;
