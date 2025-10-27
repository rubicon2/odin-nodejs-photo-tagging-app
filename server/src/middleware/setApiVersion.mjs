export default function setApiVersion(version) {
  // Add api version to req, so can easily use that info in controller for specific logic.
  // Not sure that is the best approach though - probably totally seperate controllers for each
  // version is best. A v2 could re-export v1 except for changed methods?
  return (req, res, next) => {
    if (typeof version !== 'object') {
      req.apiVersion =
        typeof version === 'function' ? version(req, res) : version;
    }
    next();
  };
}
