import React, { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  useDeleteUserMutation,
  useSigninMutation,
  useUpdateUserMutation,
} from '../../app/RtkQuery';
import { Modal } from '../../components';
import { ErrorSign } from '../../components/modal/components';
import { saveTokenToLS } from '../../features/ls-load-save';
import { loginUser, logoutUser } from '../../reducers/auth';
import { setEmptyUser } from '../../reducers/userReducer';
import './UserProfile.scss';

export type UserEditValues = {
  name: string;
  login: string;
  oldpassword: string;
  newpassword: string;
};

const UserProfile: FC = () => {
  const { userId, userName, userLogin } = useAppSelector((state) => state.userStorage);
  const [updateUser] = useUpdateUserMutation();
  const [signinUser] = useSigninMutation();
  const [deleteUser] = useDeleteUserMutation();
  const dispatch = useAppDispatch();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [deleteMsg, setDeleteMsg] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPassChanging, setIsPassChanging] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserEditValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { name: userName, login: userLogin, oldpassword: '', newpassword: '' },
  });

  useEffect(() => {
    if (!activeModal) {
      setErrorMsg('');
      setSuccessMsg('');
      setDeleteMsg(false);
    }
  }, [activeModal]);

  const onSubmit = async ({ name, login, oldpassword, newpassword }: UserEditValues) => {
    const body = {
      name: isPassChanging ? userName : name,
      login: isPassChanging ? userLogin : login,
      password: isPassChanging ? newpassword : oldpassword,
    };
    signinUser({ login: userLogin, password: oldpassword })
      .unwrap()
      .then(() => {
        return updateUser({ userId, body }).unwrap();
      })
      .then(() => {
        return signinUser({
          login: isPassChanging ? userLogin : login,
          password: isPassChanging ? newpassword : oldpassword,
        }).unwrap();
      })
      .then(({ token }) => {
        dispatch(loginUser(token));
        saveTokenToLS(token);
      })
      .then(() => {
        console.log(userName);
        reset({
          name: name,
          login: login,
          oldpassword: '',
          newpassword: '',
        });
        setIsEditing(false);
        setActiveModal(true);
        setSuccessMsg(isPassChanging ? 'Password update successful!' : 'User update successful!');
      })
      .catch((error) => {
        setActiveModal(true);
        if (error.data.statusCode === 403) {
          setErrorMsg('Wrong password');
        } else {
          setErrorMsg(error.data.message);
        }
      });
  };

  const deleteHandler = async () => {
    deleteUser(userId)
      .unwrap()
      .then((data) => {
        if (!data) {
          dispatch(logoutUser());
          dispatch(setEmptyUser());
          saveTokenToLS('');
        }
      })
      .catch((error) => {
        setActiveModal(true);
        setErrorMsg(error.data.message);
      });
  };

  useEffect(() => {
    if (!activeModal) {
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [activeModal]);

  return (
    <>
      {!isEditing && (
        <div className="user-profile">
          <div className="user-profile__field">Name:</div>
          <div className="user-profile__value">{userName}</div>
          <div className="user-profile__field">Login: </div>
          <div className="user-profile__value">{userLogin}</div>
          <button
            className="user-profile__button"
            onClick={() => {
              setIsEditing(true);
              setIsPassChanging(false);
            }}
          >
            Edit user
          </button>
          <button
            className="user-profile__button"
            onClick={() => {
              setIsEditing(true);
              setIsPassChanging(true);
            }}
          >
            Change password
          </button>
          <button
            className="user-profile__button"
            onClick={() => {
              setActiveModal(true);
              setDeleteMsg(true);
            }}
          >
            Delete
          </button>
        </div>
      )}

      {isEditing && (
        <form className="signup" onSubmit={handleSubmit(onSubmit)}>
          {!isPassChanging && (
            <>
              <label className="form__nickname" title="Only numbers and english letters">
                <span className="form__label-tittle">Name:</span>
                <input
                  className="signup__name"
                  {...register('name', {
                    required: 'Empty name',
                    pattern: {
                      value: /^[A-Za-z0-9]+$/i,
                      message: 'Only numbers and english letters!',
                    },
                    validate: {
                      nameLength: (v) => v.length > 3 || 'Name can not be less than 4 letters',
                    },
                  })}
                  placeholder="Enter your name"
                />
                {errors.name && <div className="form__error">{errors.name.message}</div>}
              </label>
              <label className="form__nickname" title="Only numbers and english letters">
                <span className="form__label-tittle">Login:</span>
                <input
                  className="signup__name"
                  {...register('login', {
                    required: 'Empty login',
                    pattern: {
                      value: /^[A-Za-z0-9]+$/i,
                      message: 'Only numbers and english letters!',
                    },
                    validate: {
                      nameLength: (v) => v.length > 3 || 'Login can not be less than 4 letters',
                    },
                  })}
                  placeholder="Enter your login"
                />
                {errors.login && <div className="form__error">{errors.login.message}</div>}
              </label>
            </>
          )}
          <label className="form__password">
            <span className="form__label-tittle">Old password:</span>
            <input
              className="signup__password"
              type="password"
              {...register('oldpassword', {
                required: 'Empty password',
                validate: {
                  passLength: (v) => v.length > 3 || 'Password can not be less than 4 letters',
                },
              })}
              placeholder="Enter your password"
            />
            {errors.oldpassword && <div className="form__error">{errors.oldpassword.message}</div>}
          </label>

          {isPassChanging && (
            <label className="form__password">
              <span className="form__label-tittle">New password:</span>
              <input
                className="signup__password"
                type="password"
                {...register('newpassword', {
                  required: 'Empty password',
                  validate: {
                    passLength: (v) => v.length > 3 || 'Password can not be less than 4 letters',
                  },
                })}
                placeholder="Enter your password"
              />
              {errors.newpassword && (
                <div className="form__error">{errors.newpassword.message}</div>
              )}
            </label>
          )}

          <input type="submit" value="Update" className="form__submit" />
          <input
            type="button"
            value="Cancel"
            className="form__submit"
            onClick={() => {
              setIsEditing(false);
              reset();
            }}
          />
        </form>
      )}

      <Modal activeModal={activeModal} setActiveModal={setActiveModal}>
        <>
          {!!errorMsg && <ErrorSign errorMsg={errorMsg} />}
          {!!successMsg && (
            <div className="error-modal">
              <h3 className="error-modal__title green">Success!</h3>
              <div>{successMsg}</div>
            </div>
          )}
          {!!deleteMsg && (
            <div className="modal__text">
              <h2>{`Do you want to delete user '${userName}'`} ?</h2>
              <div>After deletion, you will be redirected to the welcome page!</div>
              <button type="button" onClick={deleteHandler}>
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(false);
                  setDeleteMsg(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      </Modal>
    </>
  );
};

export { UserProfile };