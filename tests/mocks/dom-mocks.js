export const makeClassList = (...defaultClasses) => {
  const dictionary = defaultClasses.reduce((acc, cur) => {
    acc[cur] = cur;
    return acc;
  }, {});

  return {
    dictionary,
    add: (s) => dictionary[s] = s,
    remove: (s) => delete dictionary[s],
    contains: (s) => (s in dictionary)
  };
};
