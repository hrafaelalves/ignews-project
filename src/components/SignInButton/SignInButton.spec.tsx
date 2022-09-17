import { fireEvent, render, screen } from '@testing-library/react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { SignInButton } from '.';

jest.mock("next-auth/react");

describe('SignInButton component', () => {
    it('renders correctly when user is not authenticated', () => {
        const useSessiontMocked = jest.mocked(useSession);

        useSessiontMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated"
        });

        render(<SignInButton />)

        expect(screen.getByText('Sign in with Github')).toBeInTheDocument();
    });

    it('renders correctly when user is authenticated', () => {
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce({
            data: {
                user: {
                    name: "John Doe",
                    email: "johndoe@example.com"
                },
                expires: 'fake-expires'
            },
            status: "authenticated"
        });

        render(<SignInButton />)

        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('redirects and logout user when signOut button has been clicked', () => {
        const signOutMocked = jest.mocked(signOut);
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce({
            data: {
                user: {
                    name: "John Doe",
                    email: "johndoe@example.com"
                },
                expires: 'fake-expires'
            },
            status: "authenticated"
        } as any);

        render(<SignInButton />);

        const singOutButton = screen.getByText('John Doe');

        fireEvent.click(singOutButton)

        expect(signOutMocked).toHaveBeenCalled();
    })

    it('redirects to sign in and login when user is not authenticated', () => {
        const signInMocked = jest.mocked(signIn);

        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated"
        } as any);

        render(<SignInButton/>);

        const singInButton = screen.getByText('Sign in with Github');

        fireEvent.click(singInButton);

        expect(signInMocked).toHaveBeenCalled();
    });
})
