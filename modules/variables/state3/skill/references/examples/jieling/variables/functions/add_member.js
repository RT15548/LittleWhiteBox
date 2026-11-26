([members, name, age, job, kink, wants, is, hates, control, attitude]) =>
  ({ ...members, [name]: { age, job, kink, wants, is, hates, control, status: '在读', room: '', attitude } })
