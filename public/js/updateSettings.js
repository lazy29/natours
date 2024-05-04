import axios from 'axios';
import { showToaster } from './alerts';

// type is either 'userDetails' or 'userPassword'
export const updateSettings = async function (type, data) {
  try {
    const url =
      type === 'userPassword'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showToaster(
        'success',
        `Your ${type === 'userPassword' ? 'password' : 'name, email and photo'} has successfully updated.`,
      );

      if (type === 'userDetails')
        window.setTimeout(() => {
          location.reload(true);
        }, 1500);
    }
  } catch (err) {
    showToaster('error', err.response.data.message);
  }
};
