export default function MagicLinkConfirmation({ phone }: { phone: string }) {
  return (
    <>
      <h1 className="text-xl text-center font-black pt-12">
        Okay, we texted {phone}.
      </h1>
      <p className="pt-6 text-center">
        Check your text messages for a link to the prop sheet.
      </p>
    </>
  );
}
