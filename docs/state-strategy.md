# State Strategy

- ProjectsContext (global): projects array + actions (addProject, updateProject, addDonation, removeProject)
- ToastContext (global): transient notifications (showToast, removeToast)
- Home (local): search/query/filter/sort + modal state
- Dashboard (local): editor form state + image preview URL

# Custom Hook

useLocalStorageState(key, initialValue)
- API: const [value, setValue, reset] = useLocalStorageState(...)
- Why: centralizes persistence logic, reduces repeated localStorage handling
- Testable: verify read/write/reset behavior without UI
