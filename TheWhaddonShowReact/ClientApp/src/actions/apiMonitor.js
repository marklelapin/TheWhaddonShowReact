export const UPDATE_FROM_TO = 'UPDATE_FROM_TO';

export default function updateFromTo(payload) {
  return {
    type: UPDATE_FROM_TO,
    payload
  };
}
