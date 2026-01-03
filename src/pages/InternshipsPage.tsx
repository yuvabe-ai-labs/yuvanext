import { getInternships } from "@/services/internships.service";
import { useEffect, useState } from "react";

const InternshipsPage = () => {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getInternships();
      setInternships(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      {internships.map((internship) => (
        <div key={internship.id}>{internship.title}</div>
      ))}
    </div>
  );
};

export default InternshipsPage;
