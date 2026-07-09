import { useState, useEffect } from "react";
import axios from "axios";
function AdminDashboard() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    skillsRequired: "",
    minimumCGPA: "",
    eligibleBranches: "",
    description: "",
  });
  const [internships, setInternships] = useState([]);
  const [editingId, setEditingId] = useState(null);

  console.log("CURRENT editingId:", editingId);
  console.log("CURRENT formData:", formData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async () => {

    try {

        const token = localStorage.getItem("token");

        const internship = {

            title: formData.title,

            company: formData.company,

            location: formData.location,

            skillsRequired: formData.skillsRequired
                .split(",")
                .map(skill => skill.trim()),

            minimumCGPA: Number(formData.minimumCGPA),

            eligibleBranches: formData.eligibleBranches
                .split(",")
                .map(branch => branch.trim()),

            description: formData.description

        };
        
        console.log("TOKEN:", token);
        console.log("ROLE:", localStorage.getItem("role"));
        let response;

if (editingId) {

  response = await axios.put(

    `http://localhost:5000/api/internships/${editingId}`,

    internship,

    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

  );

} else {

  response = await axios.post(

    "http://localhost:5000/api/internships",

    internship,

    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

  );

}

        /*alert("Internship Added Successfully");

        console.log(response.data);*/

        if (editingId) {
            alert("Internship Updated Successfully");
        } else {
            alert("Internship Added Successfully");
        }

        fetchInternships();
        setEditingId(null);

        setFormData({
            title: "",
            company: "",
            location: "",
            skillsRequired: "",
            minimumCGPA: "",
            eligibleBranches: "",
            description: "",
        });
    }

    catch (error) {
        console.log(error);

        console.log("Status:", error.response?.status);
        console.log("Data:", error.response?.data);

        alert("Failed to add internship");
    }

};
const fetchInternships = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/internships"
    );

    setInternships(response.data);
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
  fetchInternships();
}, []);
/*const deleteInternship = async (id) => {

  const confirmDelete = window.confirm(
    "Delete this internship?"
  );

  if (!confirmDelete) return;

  try {

    const token = localStorage.getItem("token");

    await axios.delete(

      `http://localhost:5000/api/internships/${id}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

    );

    alert("Internship Deleted");

    await fetchInternships();

  }

  catch (error) {
  console.log(error);
  console.log(error.response);
  console.log(error.response?.data);
  alert("Delete failed");
}

};*/
const deleteInternship = async (id) => {
  const confirmDelete = window.confirm("Delete this internship?");

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    console.log("1. Before delete");

    await axios.delete(
      `http://localhost:5000/api/internships/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("2. Delete successful");

    alert("Internship Deleted");

    console.log("3. Before fetch");

    await fetchInternships();

    console.log("4. Fetch completed");

  } catch (error) {
    console.log("ERROR OCCURRED");
    console.log(error);
    console.log(error.response);
    console.log(error.response?.data);

    alert("Delete failed");
  }
};
const handleEdit = (internship) => {
  console.log("EDIT CLICKED");

  setEditingId(internship._id);

  console.log("SETTING ID:", internship._id);

  setFormData({
    title: internship.title,
    company: internship.company,
    location: internship.location,
    skillsRequired: internship.skillsRequired.join(", "),
    minimumCGPA: internship.minimumCGPA,
    eligibleBranches: internship.eligibleBranches.join(", "),
    description: internship.description,
  });
};
/*const handleEdit = (internship) => {

  setEditingId(internship._id);

  setFormData({
    title: internship.title,
    company: internship.company,
    location: internship.location,
    skillsRequired: internship.skillsRequired.join(", "),
    minimumCGPA: internship.minimumCGPA,
    eligibleBranches: internship.eligibleBranches.join(", "),
    description: internship.description,
  });

}; */

const handleCancelEdit = () => {

  setEditingId(null);

  setFormData({
    title: "",
    company: "",
    location: "",
    skillsRequired: "",
    minimumCGPA: "",
    eligibleBranches: "",
    description: "",
  });

};
  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">

        <h1 className="text-3xl font-bold mb-8">
          
          Add Internship

        </h1>

        <div className="space-y-4">

          <input
            name="title"
            placeholder="Internship Title"
            className="w-full border p-3 rounded"
            value={formData.title}
            onChange={handleChange}
          />

          <input
            name="company"
            placeholder="Company"
            className="w-full border p-3 rounded"
            value={formData.company}
            onChange={handleChange}
          />

          <input
            name="location"
            placeholder="Location"
            className="w-full border p-3 rounded"
            value={formData.location}
            onChange={handleChange}
          />

          <input
            name="skillsRequired"
            placeholder="Skills (comma separated)"
            className="w-full border p-3 rounded"
            value={formData.skillsRequired}
            onChange={handleChange}
          />

          <input
            name="minimumCGPA"
            placeholder="Minimum CGPA"
            className="w-full border p-3 rounded"
            value={formData.minimumCGPA}
            onChange={handleChange}
          />

          <input
            name="eligibleBranches"
            placeholder="Eligible Branches (comma separated)"
            className="w-full border p-3 rounded"
            value={formData.eligibleBranches}
            onChange={handleChange}
          />

          <textarea
            rows="5"
            name="description"
            placeholder="Description"
            className="w-full border p-3 rounded"
            value={formData.description}
            onChange={handleChange}
          />

          
          <div className="flex gap-4">

        <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
            {editingId ? "Update Internship" : "Add Internship"}
        </button>

        {editingId && (

            <button
            onClick={handleCancelEdit}
            className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
            >
            Cancel
            </button>

    )}

        </div>

        </div>

      </div>
      <hr className="my-10" />

        <h2 className="text-2xl font-bold mb-6">
        All Internships
        </h2>

        <div className="space-y-6">

        {internships.map((internship) => (

            <div
            key={internship._id}
            className="border rounded-lg p-5 shadow"
            >

            <h3 className="text-xl font-bold">
                {internship.title}
            </h3>

            <p>
                <strong>Company:</strong> {internship.company}
            </p>

            <p>
                <strong>Location:</strong> {internship.location}
            </p>

            <p>
                <strong>Minimum CGPA:</strong> {internship.minimumCGPA}
            </p>

            <p>
                <strong>Skills:</strong>{" "}
                {internship.skillsRequired.join(", ")}
            </p>

            <p>
                <strong>Branches:</strong>{" "}
                {internship.eligibleBranches.join(", ")}
            </p>

            <p className="mt-3">
                {internship.description}
            </p>
            <div className="mt-5">
                
                <button
                    onClick={() => handleEdit(internship)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-3"
                    >
                    Edit
                </button>
                
                <button
                    onClick={() => deleteInternship(internship._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Delete
                </button>
                

                </div>
            </div>

        ))}

        </div>
    </div>
  );
}

export default AdminDashboard;