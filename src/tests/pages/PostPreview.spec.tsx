import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = { 
    slug: 'my-new-post', 
    title: 'My New Post', 
    content: "<p>Post excerpt</p>", 
    updatedAt: '10 de Abril' 
};

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}))

jest.mock('next-auth/react');

jest.mock('../../services/prismic');

describe('Post preview page', () => {
    it('renders correctly', () => {
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValueOnce({
            status: "unauthenticated",
            data: {
                activeSubscription: null,
                expires: null
            }   
        }as any);

        render(<Post post={post} />);

        expect(screen.getByText("My New Post")).toBeInTheDocument();
        expect(screen.getByText("Post excerpt")).toBeInTheDocument();
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
    });

     it('redirects user to full post when user is subscribe', async () => {
        const useSessionMocked = jest.mocked(useSession);
        const useRouterMocked = jest.mocked(useRouter);
        const pushMocked = jest.fn();

        useSessionMocked.mockReturnValueOnce({
            data: {
                activeSubscription: 'fake-active-subscription',
                expires: null
            },
            status: 'authenticated'
        });

        useRouterMocked.mockReturnValueOnce({
            push: pushMocked,
        } as any)

        render(<Post post={post} />);

        expect(pushMocked).toHaveBeenCalledWith('/posts/my-new-post')
    })

    it('loads initial data', async () => {
        const getPrismicClientMocked = jest.mocked(getPrismicClient);

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        {
                            type: "heading",
                            text: "My new post"
                        }
                    ],
                    content: [
                        {
                            type: 'paragraph', text: 'Post content'
                        }
                    ]
                },
                last_publication_date: '09-20-2022'
            })
        }as any)

        const response = await getStaticProps({ params: { slug: "my-new-post" } });

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post content</p>',
                        updatedAt: '20 de setembro de 2022'
                    }
                }
            })
        )
    })
})