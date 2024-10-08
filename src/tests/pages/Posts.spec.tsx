import { render, screen } from '@testing-library/react';
import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

const posts = [
    { slug: 'my-new-post', title: 'My New Post', excerpt: "Post excerpt", updatedAt: '10 de Abril' }
];

jest.mock('../../services/prismic');

describe('Posts page', () => {
    it('renders correctly', () => {
        render(<Posts posts={posts} />);

        expect(screen.getByText("My New Post")).toBeInTheDocument();
    });

    it('loads initial data', async () => {
        const getPrismicClientMocked = jest.mocked(getPrismicClient);

        getPrismicClientMocked.mockReturnValueOnce({
            getByType: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'my-new-post',
                        data: {
                            title: [
                                { type: 'heading', text: 'My new post' }
                            ],
                            content: [
                                { type: 'paragraph', text: 'Post excerpt' }
                            ]
                        },
                        last_publication_date: '09-12-2022'
                    }
                ]
            })
        } as any)

        const response = await getStaticProps({ previewData: undefined });

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [
                        {
                            slug: "my-new-post",
                            title: "My new post",
                            excerpt: "Post excerpt",
                            updatedAt: "12 de setembro de 2022"
                        }
                    ]
                }
            })
        )
    })
})