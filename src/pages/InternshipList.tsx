import { useInternship } from "@/hooks/useInternships";
import { useInternshipStore } from "@/stores/internships.store";

const InternshipList = () => {
  const { data, isLoading, error } = useInternship();
  const setSelectedInternship = useInternshipStore(
    (s) => s.setSelectedInternship
  );

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load internships</p>;

  return (
    <div className="grid gap-4">
      {data?.map((internship) => (
        <div
          key={internship.id}
          className="cursor-pointer rounded border p-4"
          onClick={() => setSelectedInternship(internship)}
        >
          <h3 className="font-semibold">{internship.title}</h3>
          <p className="text-sm text-muted-foreground">
            {internship.description}
          </p>
          <p className="text-sm text-muted-foreground">{internship.duration}</p>
        </div>
      ))}
    </div>
  );
};

export default InternshipList;
