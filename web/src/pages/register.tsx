import React from 'react';
import { Formik, Field, Form } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
  Button
} from '@chakra-ui/react';

import { useMutation } from 'urql';

import { Wrapper } from '../components/Wrapper';

import { InputField } from '../components/InputField';

interface registerProps {}

const REGISTER_MUT = `
  mutation Register($username:String!, $password:String!) {
    register(options:{ username:$username, password:$password }) {
      errors {
        message
        field
      }
      user {
        username
        id
      }
    }
  }
`;

const Register: React.FC<registerProps> = ({}) => {
  const [_, register] = useMutation(REGISTER_MUT);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{
          username: '',
          password: ''
        }}
        onSubmit={async (values) => {
          const response = await register(values);
        }}
      >
        {({ handleChange, values, isSubmitting }) => {
          return (
            <Form>
              <InputField
                name="username"
                placeholder="username"
                label="Username"
              />
              <Box mt={4}>
                <InputField
                  name="password"
                  type="password"
                  placeholder="password"
                  label="Password"
                />
              </Box>
              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                register
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default Register;
