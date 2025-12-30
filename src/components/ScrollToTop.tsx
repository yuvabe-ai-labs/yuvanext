import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // "POP" means the user clicked the Back or Forward button.
    // We ONLY scroll to top if it is NOT a "POP" event.
    if (navType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [location, navType]);

  return null;
};

export default ScrollToTop;
