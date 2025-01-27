import FieldTrainingsBox from "@/components/FieldTrainingsBox";

const FieldTraining = async ({
  params,
}: {
  params: Promise<{ field_id: string }>;
}) => {
  const fieldId = (await params).field_id;

  return (
    <>
      <FieldTrainingsBox fieldId={fieldId}></FieldTrainingsBox>
    </>
  );
};

export default FieldTraining;
