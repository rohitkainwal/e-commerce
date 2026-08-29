const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="h-10 w-10 border-4 border-primary-50 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-ink-500 text-sm">{text}</p>
    </div>
  );
};

export default Loader;
