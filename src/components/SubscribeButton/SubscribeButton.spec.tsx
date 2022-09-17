import { fireEvent, render, screen } from '@testing-library/react';
import { useSession, signIn } from 'next-auth/react';
import { SubscribeButton } from '.';
import { useRouter } from 'next/router';
import { getStripeJs } from '../../services/stripe-js';
import AxiosMock from 'axios-mock-adapter';
import { api } from '../../services/api';

const apiMock = new AxiosMock(api);

jest.mock("next-auth/react");

jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
}));

jest.mock("../../services/api");

jest.mock("../../services/stripe-js");

describe('SubscribeButton component', () => {
    beforeEach(() => {
        apiMock.reset();
    });

    it('renders correctly', () => {
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce([null, false] as any);

        render(<SubscribeButton />)

        expect(screen.getByText('Subscribe now')).toBeInTheDocument();
    });

    it("redirects user to sign in when not authenticated", () => {
        const signInMocked = jest.mocked(signIn);
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce([null, false] as any);

        render(<SubscribeButton />);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton)

        expect(signInMocked).toHaveBeenCalled();
    })

    it("redirects to posts when user already has a subscription", () => {
        const userRouterMocked = jest.mocked(useRouter);
        const useSessionMocked = jest.mocked(useSession);
        const pushMock = jest.fn();

        useSessionMocked.mockReturnValueOnce({
            data: {
                user: {
                    name: "John Doe",
                    email: "johndoe@example.com"
                },
                activeSubscription: 'fake-active-subscription',
                expires: 'fake-expires'
            },
            status: "authenticated"
        });

        userRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any)

        render(<SubscribeButton />);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(pushMock).toHaveBeenCalledWith('/posts')
    });

    /* it('should redirect to checkout when user doesn\'t have a subscription', async () => {
        
        const useSessionMocked = jest.mocked(useSession);
        const getStripeJsMocked = jest.mocked(getStripeJs);
        const redirectToCheckoutMocked = jest.fn();

        useSessionMocked.mockReturnValueOnce({
            data: {
                user: {
                    name: "John Doe",
                    email: "johndoe@example.com"
                },
                activeSubscription: null,
                expires: null
            },
            status: "authenticated"
        } as any);

        render(<SubscribeButton />);

        const fakeSessionId = "fake-session-id";

        apiMock.onPost(`/subscribe`).reply(function() {
            return [200, {
                data: {
                    sessionId: fakeSessionId
                }
            }]
        });

        getStripeJsMocked.mockResolvedValueOnce({
            redirectToCheckout: redirectToCheckoutMocked.mockResolvedValueOnce({
                sessionId: fakeSessionId
            })
        } as any);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(redirectToCheckoutMocked).toHaveBeenCalledWith({ sessionId: fakeSessionId });
    }) */
})